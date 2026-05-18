// ✅ Pure Tailwind — no missing CSS classes, works immediately
const Loading = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
      <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
      <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" />
    </div>
  );
};

export default Loading;

// const Loading = () => {
//   return (
//     <div className='dots-container'>
//       <div className='dot'></div>
//       <div className='dot'></div>
//       <div className='dot'></div>
//       <div className='dot'></div>
//       <div className='dot'></div>
//     </div>
//   );
// };

// export default Loading;
