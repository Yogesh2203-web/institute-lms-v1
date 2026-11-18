
const AuthGuard = (() => {
    const ROLE_DASHBOARDS = {
        business_head: "../dashboard/business-head.html",
        manager: "../dashboard/manager.html",
        trainer: "../dashboard/trainer.html",
        student: "../dashboard/student.html"
    };

    async function protect(allowedRoles = []) {
        try {
            const response = await API.get("/api/me");

            if (!response.user) {
                redirectToLogin();
                return null;
            }

            const user = response.user;

            if (user.status !== "active") {
                await API.post("/api/logout", {});
                redirectToLogin("Your account is inactive.");
                return null;
            }

            if (
                allowedRoles.length > 0 &&
                !allowedRoles.includes(user.role)
            ) {
                const correctDashboard = ROLE_DASHBOARDS[user.role];

                if (correctDashboard) {
                    window.location.replace(correctDashboard);
                } else {
                    redirectToLogin("Access denied.");
                }

                return null;
            }

            return user;

        } catch (error) {
            redirectToLogin("Please sign in to continue.");
            return null;
        }
    }

    function redirectToLogin(message = "") {
        if (message) {
            sessionStorage.setItem("loginMessage", message);
        }

        window.location.replace("../pages/login.html");
    }

    return { protect };
})();
