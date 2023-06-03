import { Input } from "@material-tailwind/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { Ticket } from "./index.js";

export const Tickets = () => {
  const { lotteryInPurchase, tickets } = useContext(AppContext);
  const [lotteryNo, setLotteryNo] = useState(lotteryInPurchase);

  const ticketsRef = useRef(tickets);
  useEffect(() => {
    ticketsRef.current = tickets;
  }, [tickets]);

  useEffect(() => {
    setTimeout(() => {
      setLotteryNo(
        Math.max(
          ...Array.from(Object.keys(ticketsRef.current || {})).map((i) =>
            parseInt(i)
          ),
          0
        )
      );
    }, 100);
  }, []);

  const ticketsToShow =
    lotteryNo == 0
      ? Array.from(Object.values(tickets))
          .flat()
          .sort((a, b) => b.ticketNo - a.ticketNo)
      : tickets[lotteryNo]
      ? tickets[lotteryNo].sort((a, b) => b.ticketNo - a.ticketNo)
      : [];

  return (
    <div className="flex flex-col w-full justify-center items-center pb-10">
      <div className="w-full flex justify-center">
        <div className="flex flex-row w-1/2">
          <p className="text-green-200 text-lg w-full mt-1">
            Filter Tickets by lottery number
          </p>
          <div className="w-full flex items-start">
            <Input
              name="lotteryNo"
              type="number"
              min={0}
              max={lotteryInPurchase}
              value={lotteryNo}
              className="border-2 border-green-200 text-green-200 text-lg"
              onChange={(e) => {
                e.preventDefault();
                setLotteryNo(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex pt-5 w-full justify-center">
        <div className="flex flex-row w-11/12 space-x-4 justify-start overflow-scroll border border-green-100 rounded-2xl p-2">
          {ticketsToShow.length > 0 &&
            ticketsToShow.map((ticket, index) => (
              <Ticket
                key={ticket.lotteryNo + "_" + ticket.ticketNo + "_" + index}
                data={ticket}
              />
            ))}
          {ticketsToShow.length == 0 && (
            <div className="w-full flex justify-center items-center h-24">
              <h1 className="mb-2 rounded-xl bg-red-400 bg-opacity-50 w-5/12">
                You have no tickets for given lottery
              </h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
