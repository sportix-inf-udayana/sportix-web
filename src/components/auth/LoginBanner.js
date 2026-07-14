export default function LoginBanner({ title = "Welcome Back", subtitle = "Please sign in to continue" }) {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">{subtitle}</p>
    </header>
  );
}