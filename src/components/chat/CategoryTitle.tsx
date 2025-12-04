export default function CategoryTitle({ title }: { title: string }) {
  return (
    <span className="text-[10px] text-gray-400 uppercase tracking-wider select-none">
      {title}
    </span>
  );
}
