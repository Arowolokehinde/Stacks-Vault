;; clarity-version 4
;; Simple Bitcoin Treasury DAO
;; Community manages pooled sBTC funds through voting

;; token definitions
(define-fungible-token sbtc-token)

;; constants
(define-constant err-not-member (err u101))
(define-constant err-proposal-not-found (err u102))
(define-constant err-voting-ended (err u103))
(define-constant err-insufficient-funds (err u104))
(define-constant err-already-voted (err u105))
(define-constant err-voting-not-ended (err u106))
(define-constant err-already-executed (err u107))
(define-constant err-proposal-rejected (err u108))
(define-constant err-asset-restriction-failed (err u109))
(define-constant err-invalid-signature (err u110))
(define-constant err-passkey-not-found (err u111))
(define-constant err-invalid-contract-hash (err u112))

;; Voting period: 24 hours (144 blocks * 10 minutes per block)
(define-constant voting-period-blocks u144)

;; data vars
(define-data-var proposal-nonce uint u0)
(define-data-var treasury-principal principal tx-sender)

;; data maps
(define-map dao-members principal bool)
(define-map proposals
  uint
  {
    creator: principal,
    amount: uint,
    recipient: principal,
    yes-votes: uint,
    no-votes: uint,
    end-block: uint,
    end-timestamp: uint,
    executed: bool,
    created-at: uint
  }
)
(define-map member-votes { proposal-id: uint, voter: principal } bool)

;; passkey storage for biometric authentication (Clarity 4)
(define-map member-passkeys principal (buff 33))

;; trusted contracts registry (Clarity 4)
(define-map trusted-contracts principal bool)

;; read-only functions (defined before use)
(define-read-only (is-member (user principal))
  (default-to false (map-get? dao-members user))
)

;; public functions
(define-public (join-dao)
  (begin
    (map-set dao-members tx-sender true)
    (ok true)
  )
)

;; Join DAO with passkey (secp256r1-verify - Clarity 4)
(define-public (join-dao-with-passkey (public-key (buff 33)) (message-hash (buff 32)) (signature (buff 64)))
  (begin
    (asserts! (secp256r1-verify message-hash signature public-key) err-invalid-signature)
    (map-set dao-members tx-sender true)
    (map-set member-passkeys tx-sender public-key)
    (ok true)
  )
)

;; Vote with passkey authentication (secp256r1-verify - Clarity 4)
(define-public (vote-with-passkey (proposal-id uint) (vote-yes bool) (message-hash (buff 32)) (signature (buff 64)))
  (let (
    (proposal (unwrap! (map-get? proposals proposal-id) err-proposal-not-found))
    (passkey (unwrap! (map-get? member-passkeys tx-sender) err-passkey-not-found))
  )
    (asserts! (secp256r1-verify message-hash signature passkey) err-invalid-signature)
    (asserts! (is-member tx-sender) err-not-member)
    (asserts! (< stacks-block-time (get end-timestamp proposal)) err-voting-ended)
    (asserts! (is-none (map-get? member-votes { proposal-id: proposal-id, voter: tx-sender })) err-already-voted)

    (map-set member-votes { proposal-id: proposal-id, voter: tx-sender } true)

    (if vote-yes
      (map-set proposals proposal-id (merge proposal { yes-votes: (+ (get yes-votes proposal) u1) }))
      (map-set proposals proposal-id (merge proposal { no-votes: (+ (get no-votes proposal) u1) }))
    )
    (ok true)
  )
)

;; Register trusted contract - simplified (Clarity 4)
(define-public (register-trusted-contract (contract principal))
  (begin
    (asserts! (is-member tx-sender) err-not-member)
    (map-set trusted-contracts contract true)
    (ok true)
  )
)

(define-public (deposit (amount uint))
  (begin
    (asserts! (is-member tx-sender) err-not-member)
    (ft-mint? sbtc-token amount tx-sender)
  )
)

(define-public (create-proposal (amount uint) (recipient principal))
  (let (
    (proposal-id (+ (var-get proposal-nonce) u1))
    (current-time stacks-block-time)
    (voting-deadline (+ stacks-block-time u86400)) ;; 24 hours in seconds
  )
    (asserts! (is-member tx-sender) err-not-member)
    (map-set proposals proposal-id {
      creator: tx-sender,
      amount: amount,
      recipient: recipient,
      yes-votes: u0,
      no-votes: u0,
      end-block: (+ stacks-block-height voting-period-blocks),
      end-timestamp: voting-deadline,
      executed: false,
      created-at: current-time
    })
    (var-set proposal-nonce proposal-id)
    (ok proposal-id)
  )
)

(define-public (vote (proposal-id uint) (vote-yes bool))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) err-proposal-not-found)))
    (asserts! (is-member tx-sender) err-not-member)
    (asserts! (< stacks-block-time (get end-timestamp proposal)) err-voting-ended)
    (asserts! (is-none (map-get? member-votes { proposal-id: proposal-id, voter: tx-sender })) err-already-voted)

    (map-set member-votes { proposal-id: proposal-id, voter: tx-sender } true)

    (if vote-yes
      (map-set proposals proposal-id (merge proposal { yes-votes: (+ (get yes-votes proposal) u1) }))
      (map-set proposals proposal-id (merge proposal { no-votes: (+ (get no-votes proposal) u1) }))
    )
    (ok true)
  )
)

(define-public (execute-proposal (proposal-id uint))
  (let (
    (proposal (unwrap! (map-get? proposals proposal-id) err-proposal-not-found))
    (transfer-amount (get amount proposal))
    (transfer-recipient (get recipient proposal))
  )
    (asserts! (>= stacks-block-time (get end-timestamp proposal)) err-voting-not-ended)
    (asserts! (not (get executed proposal)) err-already-executed)
    (asserts! (> (get yes-votes proposal) (get no-votes proposal)) err-proposal-rejected)
    (asserts! (>= (ft-get-balance sbtc-token tx-sender) transfer-amount) err-insufficient-funds)

    ;; Execute transfer
    (try! (ft-transfer? sbtc-token transfer-amount tx-sender transfer-recipient))
    (map-set proposals proposal-id (merge proposal { executed: true }))
    (ok true)
  )
)

;; additional read-only functions
(define-read-only (get-treasury-balance)
  (ft-get-balance sbtc-token tx-sender)
)

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals proposal-id)
)

(define-read-only (get-proposal-status (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal
      (if (get executed proposal)
        "executed"
        (if (>= stacks-block-time (get end-timestamp proposal))
          (if (> (get yes-votes proposal) (get no-votes proposal))
            "passed-pending-execution"
            "rejected"
          )
          "voting-active"
        )
      )
    "not-found"
  )
)

(define-read-only (get-voting-deadline-info (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal
      (ok {
        end-timestamp: (get end-timestamp proposal),
        created-at: (get created-at proposal),
        time-remaining: (if (>= stacks-block-time (get end-timestamp proposal))
          u0
          (- (get end-timestamp proposal) stacks-block-time)
        ),
        is-active: (< stacks-block-time (get end-timestamp proposal))
      })
    err-proposal-not-found
  )
)

(define-read-only (has-voted (proposal-id uint) (voter principal))
  (is-some (map-get? member-votes { proposal-id: proposal-id, voter: voter }))
)

(define-read-only (get-proposal-results (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal
      (ok {
        yes-votes: (get yes-votes proposal),
        no-votes: (get no-votes proposal),
        total-votes: (+ (get yes-votes proposal) (get no-votes proposal)),
        winning: (> (get yes-votes proposal) (get no-votes proposal))
      })
    err-proposal-not-found
  )
)

;; Get proposal ID as ASCII string (to-ascii? - Clarity 4)
(define-read-only (get-proposal-id-as-string (proposal-id uint))
  (to-ascii? proposal-id)
)

;; Get formatted proposal info with ASCII labels (to-ascii? - Clarity 4)
(define-read-only (get-proposal-summary (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal
      (ok {
        id-string: (unwrap! (to-ascii? proposal-id) (err u200)),
        yes-string: (unwrap! (to-ascii? (get yes-votes proposal)) (err u201)),
        no-string: (unwrap! (to-ascii? (get no-votes proposal)) (err u202)),
        executed-string: (unwrap! (to-ascii? (get executed proposal)) (err u203))
      })
    err-proposal-not-found
  )
)

;; Verify if contract is trusted (Clarity 4)
(define-read-only (is-trusted-contract (contract principal))
  (default-to false (map-get? trusted-contracts contract))
)

;; Check if member has passkey registered
(define-read-only (has-passkey (member principal))
  (is-some (map-get? member-passkeys member))
)
