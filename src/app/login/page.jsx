"use client";

import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export default function Login() {
  const router = useRouter();

  const LoginSchema = Yup.object().shape({
    phone: Yup.string()
      .matches(/^09\d{9}$/, "Phone must be valid Iranian mobile number")
      .required("Phone is required"),

    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password too long")
      .required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setFieldError("password", data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/dashboard");

    } catch (err) {
      setFieldError("password", "Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-10 bg-gray-100 rounded-xl shadow-lg mt-20">
      <h1 className="text-center text-gray-800 mb-8 text-2xl font-bold">
        Login
      </h1>

      <Formik
        initialValues={{ phone: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">

            <div>
              <Field
                name="phone"
                type="text"
                placeholder="Phone number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              />
              <ErrorMessage
                name="phone"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <div>
              <Field
                name="password"
                type="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full p-3 bg-blue-500 text-white rounded-lg font-bold transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

          </Form>
        )}
      </Formik>
    </div>
  );
}