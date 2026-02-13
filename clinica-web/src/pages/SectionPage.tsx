export function SectionPage({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="card">
      <h1>{title}</h1>
      <p>{hint}</p>
    </div>
  );
}
