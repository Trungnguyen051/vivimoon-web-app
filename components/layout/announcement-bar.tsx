export function AnnouncementBar({ text }: { text: string }) {
  return (
    <div className="bg-foreground text-background">
      <p className="mx-auto max-w-7xl px-4 py-2.5 text-center text-xs font-medium tracking-wide">
        {text}
      </p>
    </div>
  );
}
