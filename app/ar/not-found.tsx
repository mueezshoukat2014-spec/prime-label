import Link from "@/components/AppLink";

export default function ArNotFound() {
  return (
    <main
      dir="rtl"
      lang="ar"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/10 blur-[140px]" />
      <span className="display relative gradient-text text-[34vw] leading-none sm:text-[20rem]">404</span>
      <p className="arabic-text relative mt-2 max-w-sm text-[15px] text-cream-muted">
        يبدو أن هذه الصفحة غير موجودة. خلّنا نرجعك للمكان الصحيح.
      </p>
      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/ar" className="btn-primary arabic-text">
          الصفحة الرئيسية
        </Link>
        <Link href="/ar/quote" className="btn-ghost arabic-text">
          اطلب تسعيرة
        </Link>
      </div>
    </main>
  );
}
