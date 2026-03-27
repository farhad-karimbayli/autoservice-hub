import { createBrowserRouter } from "react-router";
import { Layout } from "../components/Layout";
import { ProtectedRoute } from "../shared/auth/ProtectedRoute";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ServicesPage } from "../pages/ServicesPage";
import { MyAppointmentsPage } from "../pages/MyAppointmentsPage";
import { MyOrdersPage } from "../pages/MyOrdersPage";
import { AdminUsersPage } from "../pages/AdminUsersPage";
import { CreateAppointmentPage } from "../pages/CreateAppointmentPage";
import { CreateOrderPage } from "../pages/CreateOrderPage";
import { InventoryPage } from "../pages/InventoryPage";
import { MyPartsRequestsPage } from "../pages/MyPartsRequestsPage";
import { AllPartsRequestsPage } from "../pages/AllPartsRequestsPage";

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
                path: "appointments/create",
                element: (
                    <ProtectedRoute roles={["Client"]}>
                        <CreateAppointmentPage />
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
                path: "orders/create",
                element: (
                    <ProtectedRoute roles={["Client"]}>
                        <CreateOrderPage />
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
                path: "inventory",
                element: (
                    <ProtectedRoute roles={["Director", "Admin", "Master"]}>
                        <InventoryPage />
                    </ProtectedRoute>
                ),
            },

            {
                path: "parts-requests/my",
                element: (
                    <ProtectedRoute roles={["Master"]}>
                        <MyPartsRequestsPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "parts-requests",
                element: (
                    <ProtectedRoute roles={["Director", "Admin"]}>
                        <AllPartsRequestsPage />
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