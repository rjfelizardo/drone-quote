export default function Footer({
  companyName,
}: {
  companyName?: string;
}) {
  return (
    <footer className="border-t border-navy-700/10 bg-surface py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 text-sm text-navy-700/60 sm:flex-row sm:items-center lg:px-8">
        <p>
          {companyName
            ? `${companyName} — orçamento e pré-vistoria para operações com drone.`
            : "Drone Quote — orçamento e pré-vistoria para operações com drone."}
        </p>
        <p>{companyName ? "Powered by Drone Quote" : "Um produto Grupo Bridge"}</p>
      </div>
    </footer>
  );
}
