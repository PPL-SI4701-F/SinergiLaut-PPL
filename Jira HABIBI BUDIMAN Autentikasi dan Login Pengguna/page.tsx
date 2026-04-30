import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export default function AutentikasiPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
          Jira HABIBI BUDIMAN: Autentikasi dan Login Pengguna
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
          Halaman ini menampilkan komponen login dan register yang terhubung dengan Server Actions Next.js.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-start gap-8 max-w-5xl mx-auto mt-8">
        <div className="w-full md:w-1/2">
          <LoginForm />
        </div>
        
        <div className="w-full md:w-1/2">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
