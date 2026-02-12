import LoginForm from "./ui";

export const metadata = { title: "Login | Okasha High School" };

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold text-[color:var(--ohs-charcoal)]">Portal Login</h1>
      <p className="mt-2 text-sm text-slate-600">
        Sign in to access the student/parent/teacher/admin portal.
      </p>
      <div className="mt-6 rounded-2xl border p-5 bg-white">
        <LoginForm />
      </div>
    </main>
  );
}
