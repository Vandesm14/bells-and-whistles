export function Clickable({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
