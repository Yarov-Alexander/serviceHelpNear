import { RouterProvider } from "react-router";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { router } from "@/app/providers/router/router";

function App() {
  return (
    <div id="top">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </div>
  );
}

export default App;
