import Image from "next/image";
import Link from "next/link";

/** Cadre commun aux écrans de connexion et d'inscription. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <Link
          href="/"
          className="flex flex-col items-center gap-3 text-center"
          aria-label="Retour à l'accueil"
        >
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={56}
            height={56}
            className="rounded-xl"
          />
          <span className="text-2xl font-semibold tracking-tight text-paper-100">
            SmarCi
          </span>
        </Link>

        {children}
      </div>
    </main>
  );
}
