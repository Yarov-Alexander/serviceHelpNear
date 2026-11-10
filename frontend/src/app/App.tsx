import {router} from './poviders/router/router';
import {RouterProvider} from "react-router";

function App() {

  return (
    <div id="top">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
