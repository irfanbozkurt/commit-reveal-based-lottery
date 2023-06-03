import React, { useContext } from "react";

import { Button, Card, CardBody } from "@material-tailwind/react";

import { AppContext } from "../context/AppContext.jsx";
import { TicketStatus } from "../contracts/constants.js";
import { RandomRevealer } from "./index.js";

export const Ticket = ({ data }) => {
  const { lotteryInPurchase, contractFuncs, openModal } =
    useContext(AppContext);

  return (
    <Card className="font-bold rounded-xl eth-card .white-glassmorphism opacity-90">
      <div className="w-64" />

      <CardBody className="p-4 h-24">
        <div className="flex flex-col justify-center">
          <div className="flex w-full pb-2 space-x-2 justify-center text-black">
            <h1 className="mb-2 rounded-xl bg-yellow-900 bg-opacity-20  w-10/12 border border-black border-opacity-20">
              Lottery {data.lotteryNo}
            </h1>

            <h1 className="mb-2 rounded-xl bg-yellow-900 bg-opacity-20 w-10/12 border border-black border-opacity-20">
              Ticket {data.ticketNo}
            </h1>
          </div>

          <div className="flex justify-center">
            <h1 className="text-white rounded-xl bg-yellow-900 bg-opacity-20 w-10/12 border border-black border-opacity-20">
              {(() => {
                if (data.type == 1) return "Full Ticket";
                if (data.type == 2) return "Half Ticket";
                if (data.type == 3) return "Quarter Ticket";
              })()}
            </h1>
          </div>
        </div>
      </CardBody>

      <div className="flex justify-center px-4 space-x-4 w-full font-bold">
        {data.status == TicketStatus.Bought && (
          <>
            {lotteryInPurchase == data.lotteryNo && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  contractFuncs.refundTicket(data.ticketNo);
                }}
                className="rounded-xl text-xl pt-0 text-blue-600 opacity-70 hover:text-red-700 hover:opacity-90"
              >
                REFUND
              </Button>
            )}
            {lotteryInPurchase == data.lotteryNo + 1 && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  openModal(
                    `Enter Random Number`,
                    <RandomRevealer ticketNo={data.ticketNo} />,
                    "CLOSE"
                  );
                  contractFuncs.revealTicket();
                }}
                className="rounded-xl text-xl pt-0 text-blue-600 opacity-70 hover:text-green-700 hover:opacity-90"
              >
                REVEAL
              </Button>
            )}
          </>
        )}
        {data.status == TicketStatus.Refunded && (
          <Button disabled className="rounded-xl text-xl p-0 text-red-800">
            TICKET REFUNDED
          </Button>
        )}
        {data.status == TicketStatus.Revealed &&
          lotteryInPurchase == data.lotteryNo + 1 && (
            <Button disabled className="rounded-xl text-xl pt-0 text-green-900">
              AWAITING RESULTS
            </Button>
          )}
        {data.status == TicketStatus.Revealed &&
          lotteryInPurchase > data.lotteryNo + 1 && (
            <Button
              className="rounded-xl text-xl pt-0 text-green-600 hover:text-green-900"
              onClick={(e) => {
                e.preventDefault();
                contractFuncs.collectPrize(data.lotteryNo, data.ticketNo);
              }}
            >
              CHECK PRIZE
            </Button>
          )}
        {data.status == TicketStatus.InvalidReveal && (
          <Button disabled className="rounded-xl text-xl pt-0 text-red-800">
            INVALID REVEAL
          </Button>
        )}
        {data.status == TicketStatus.Forfeit && (
          <Button disabled className="rounded-xl text-xl pt-0 text-red-800">
            TICKET IS FORFEIT
          </Button>
        )}
        {data.status == TicketStatus.Lost && (
          <Button disabled className="rounded-xl text-xl pt-0 text-red-800">
            NO PRIZE
          </Button>
        )}
        {data.status == TicketStatus.Winner && (
          <Button
            className="rounded-xl text-xl pt-0 text-green-600 text-green-600 hover:text-green-900"
            onClick={(e) => {
              e.preventDefault();
              contractFuncs.collectPrize(data.lotteryNo, data.ticketNo);
            }}
          >
            COLLECT {data.prize ? data.prize + " Ether" : "PRIZE"}
          </Button>
        )}
        {data.status == TicketStatus.Collected && (
          <Button disabled className="rounded-xl text-xl pt-0 text-black">
            {data.prize && data.prize + " Ether"} COLLECTED
          </Button>
        )}
      </div>
    </Card>
  );
};
