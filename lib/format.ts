export const formatARS = (n: number) =>
  `$${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
