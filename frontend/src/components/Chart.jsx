import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Chart = ({ data }) => {
  // data is expected to be an array like:
  // [{ name: "To Do", total: 3 }, { name: "In Progress", total: 5 }, { name: "Completed", total: 8 }]
  return (
    <ResponsiveContainer width={"100%"} height={300}>
      <BarChart width={150} height={40} data={data}>
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="total" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};
