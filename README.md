
# Stacks-Vault - Simple Bitcoin Treasury DAO

A **community-managed treasury system** built in **Clarity** that enables members to pool **sBTC tokens**, create funding proposals, vote, and execute treasury disbursements based on democratic governance.

---

## 🚀 Features

* **DAO Membership**

  * Anyone can join the DAO via `join-dao`.
  * Membership is required to deposit, propose, or vote.

* **Treasury Management**

  * Members can deposit **sBTC tokens** into the DAO’s treasury with `deposit`.
  * Treasury balance is held in the contract.

* **Proposals**

  * Members can create spending proposals with `create-proposal`, specifying:

    * `amount` of sBTC requested.
    * `recipient` address.
  * Each proposal runs for **144 blocks** (\~1 day on Stacks).

* **Voting**

  * Members vote **Yes** or **No** on proposals with `vote`.
  * Each member can vote only once per proposal.
  * Votes are locked in the proposal state.

* **Execution**

  * After the voting period ends, any member can execute the proposal via `execute-proposal`.
  * Proposals pass if **yes-votes > no-votes** and treasury balance is sufficient.
  * Approved funds are transferred to the specified recipient.

---

## 📖 Error Codes

| Code   | Meaning                           |
| ------ | --------------------------------- |
| `u101` | Caller is not a DAO member.       |
| `u102` | Proposal not found.               |
| `u103` | Voting has ended.                 |
| `u104` | Insufficient treasury funds.      |
| `u105` | Member has already voted.         |
| `u106` | Voting period has not ended yet.  |
| `u107` | Proposal already executed.        |
| `u108` | Proposal did not pass (yes ≤ no). |

---

## 📂 Contract Structure

* **Token**

  * `sbtc-token` — fungible token representing DAO’s treasury asset.

* **Data Variables & Maps**

  * `proposal-nonce` — tracks proposal IDs.
  * `dao-members` — DAO membership registry.
  * `proposals` — proposal storage (creator, votes, status, etc.).
  * `member-votes` — tracks which members voted on which proposals.

* **Functions**

  * `join-dao` → Join DAO membership.
  * `deposit` → Deposit sBTC into DAO treasury.
  * `create-proposal` → Submit new spending proposal.
  * `vote` → Cast vote on a proposal.
  * `execute-proposal` → Execute passed proposal.
  * `is-member` → Check DAO membership.
  * `get-treasury-balance` → Get DAO treasury balance.
  * `get-proposal` → Fetch proposal details.

---

## 🔧 Example Flow

1. **Join DAO**

   ```clarity
   (contract-call? .dao-contract join-dao)
   ```
2. **Deposit Funds**

   ```clarity
   (contract-call? .dao-contract deposit u1000)
   ```
3. **Create Proposal**

   ```clarity
   (contract-call? .dao-contract create-proposal u500 'SP123...XYZ)
   ```
4. **Vote on Proposal**

   ```clarity
   (contract-call? .dao-contract vote u1 true)
   ```
5. **Execute Proposal** (after 144 blocks)

   ```clarity
   (contract-call? .dao-contract execute-proposal u1)
   ```

---

## ⚖️ Governance Rules

* One member = One vote.
* Simple majority: **Yes > No**.
* Treasury disbursements only execute if funds are available.
* Proposals can only be executed once.

---

## 📜 License

MIT License – Free to use, modify, and distribute.

---
