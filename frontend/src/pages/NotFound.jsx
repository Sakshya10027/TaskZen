import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <h1 className="mb-2 text-3xl font-bold">404</h1>
      <p className="mb-4 text-sm text-gray-500">
        The page you are looking for could not be found.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
      >
        Go home
      </Link>
    </div>
  );
}
