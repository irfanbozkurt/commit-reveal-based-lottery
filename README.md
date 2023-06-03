# Commit-Reveal Lottery

The application leverages non-malleable user commitments to eliminate the reliance on on-chain random number generation (RNG). By offloading the RNG process to end users, the application ensures a transparent and tamper-proof lottery system.

The key design principles of the application include the separation of purchase and reveal phases, cryptographic commitments, and secure reward claiming.

## Rules of Lottery

The lottery operates in rounds, each consisting of a purchase phase and a reveal phase. During the purchase phase, which spans a one-week period, users can purchase lottery tickets to participate in the ongoing lottery. To participate, users must submit a SHA-3 hash of two values: a random number and their address.

The reveal phase follows the purchase phase and lasts for another week. In this phase, participants are required to reveal the random numbers they submitted in the previous phase. Reveal actions must originate from the same address that made the cryptographic commitment, further enhancing security.

1. Purchasing round starts
2. Each user generates their own secret randomn umber(N)locally and hashes
   it with their address (msg.sender) using the SHA-3 algorithm. This creates a commitment (hash) unique to each user.
   Users submit these hashes while buying the ticket.
3. Once the purchase round ends, the reveal round begins. Reveal round for lottery number N is also the purchase time for the next lottery, N+1.

   Users are required to submit their random number (N) alongside ticket numbers in this timeframe. The contract verifies that the submitted random number matches the original commitment. If a user fails to reveal a valid random number within the specified time, their ticket is forfeited.

   Contract holds an **XOR accumulator**, which gets XOR'ed with each revealed number, at reveal time on-the-go. This is, not to off-load all the gas cost originating from a big for loop iterating all the revealed numbers. One reveals, they pay immediately.

4. After the reveal round ends, any of the corresponding read methods of the contract will trigger the winner-selection algorithm.

   This is, as smart contracts cannot invoke themselves. Once lottery time ends, any business-logic function will trigger all the past data to be processed at that point.

   The formula **XOR % numUsers** is used to select the participant who will win the lottery.

# Inspiration

https://ethereum.stackexchange.com/a/207

# Contract

[Smart Contract](./contracts/contracts/Lottery.sol) lives on Fuji at **0x02422ce78f81db2dEE4eBDf736C2AFa0b59d5406**

```bash
$ cd contracts; npm i;
```

See the tests [here](./contracts/test/Lottery.test.js). To run the tests:

```bash
$ npm hardhat test
```

# Gas Usage Report

| Method              | Min   | Max    | Avg    | # Calls |
| ------------------- | ----- | ------ | ------ | ------- |
| buyTicket           | 82661 | 116937 | 84533  | 336     |
| collectTicketRefund | -     | -      | 55933  | 2       |
| revealRndNumber     | 52030 | 118449 | 85397  | 329     |
| collectTicketPrize  | 59224 | 256693 | 133950 | 21      |
| depositEther        | 43955 | 43967  | 43955  | 339     |
| withdrawEther       | -     | -      | 33863  | 2       |

# Client Application

Is a React application leveraging ethers.js

Most critical file is [AppContext.jsx](./client/src/context/AppContext.jsx). It manages all the calls, and provides a singular umbrella to the rest of the application.

```bash
$ cd client; npm i; npm run dev;
```

# Contract-Client Communication

Contract is designed to emit specific events at critical points, allowing the client application to easily fetch user history without relying on expensive blockchain indexing services.
