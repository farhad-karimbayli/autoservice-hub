import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ProtectedRoute } from "../shared/auth/ProtectedRoute";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ServicesPage } from "../pages/ServicesPage";
import { MyAppointmentsPage } from "../pages/MyAppointmentsPage";
import { MyOrdersPage } from "../pages/MyOrdersPage";
import { AdminUsersPage } from "../pages/AdminUsersPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },
            {
                path: "services",
                element: (
                    <ProtectedRoute>
                        <ServicesPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "appointments/my",
                element: (
                    <ProtectedRoute roles={["Client"]}>
                        <MyAppointmentsPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "orders/my",
                element: (
                    <ProtectedRoute roles={["Client"]}>
                        <MyOrdersPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "admin/users",
                element: (
                    <ProtectedRoute roles={["Admin"]}>
                        <AdminUsersPage />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);