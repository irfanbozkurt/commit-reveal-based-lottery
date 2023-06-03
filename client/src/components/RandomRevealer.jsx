import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";

export const RandomRevealer = ({ ticketNo }) => {
  const { setModalOpen, contractFuncs, lotteryInPurchase } =
    useContext(AppContext);
  const [random, setRandom] = useState(0);

  return (
    <>
      {" "}
      <div className="flex w-full justify-center text-black">
        <input
          placeholder="Random number"
          name="random"
          step="1"
          min={1}
          type="number"
          value={random}
          onChange={(e) => {
            e.preventDefault();
            setRandom(e.target.value);
          }}
          className={"ml-1 mr-2 border-1 border-grey-400 text-black w-1/2"}
        />
      </div>
      <button
        className="mt-4 mr-4 rounded-3xl bg-green-500 bg-opacity-70 p-3 font-sans text-xs font-bold uppercase text-white shadow-md shadow-green-500/20 transition-all hover:shadow-lg hover:shadow-green-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
        onClick={(e) => {
          e.preventDefault();
          setModalOpen(false);
          if (random != 0) contractFuncs.revealTicket(ticketNo, random);
        }}
        data-ripple-light="true"
      >
        <i className="material-icons">REVEAL</i>
      </button>
      <p className="pt-3 font-bold">
        Lottery no: {lotteryInPurchase - 1}, Ticket no: {ticketNo}
      </p>
    </>
  );
};
