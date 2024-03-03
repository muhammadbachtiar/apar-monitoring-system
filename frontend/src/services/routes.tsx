import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../views/login/LoginPage";
import NotFound from "../views/NotFound/NotFound";
import DefaultLayout from "../layout/DefaultLayout";
import PublicRoutes from "./utils/PublicRoutes";
import PrivateRoutes from "./utils/PrivateRoutes";
const Routers: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<PublicRoutes />} >
          <Route path="/" element={<LoginPage />} />
        </Route>
        <Route element={<PrivateRoutes />} >
          <Route path="/dashboard" element={<DefaultLayout />} />
          <Route path="/profile" element={<DefaultLayout />} />
          <Route path="/location" element={<DefaultLayout />} />
          <Route path="/location/add" element={<DefaultLayout />} />
          <Route path="/account" element={<DefaultLayout />} />
          <Route path="/account/add" element={<DefaultLayout />} />
          <Route path="/account/update/:id" element={<DefaultLayout />} />
          <Route path="/apar" element={<DefaultLayout />} />
          <Route path="/apar/add" element={<DefaultLayout />} />
          <Route path="/apar/info/:id" element={<DefaultLayout />} />
          <Route path="/inspection-6-monthly" element={<DefaultLayout />} />
          <Route path="/inspection-6-monthly/add/:id" element={<DefaultLayout />} />
          <Route path="/inspection-1-monthly" element={<DefaultLayout />} />
          <Route path="/inspection-1-monthly/add/:id" element={<DefaultLayout />} />
          <Route path="/history" element={<DefaultLayout/>} />
          <Route path="/history-6-monthly/:id" element={<DefaultLayout  />} />
          <Route path="/history-6-monthly/edit/:id" element={<DefaultLayout/>} />
          <Route path="/history-1-monthly/:id" element={<DefaultLayout />} />
          <Route path="/history-1-monthly/edit/:id" element={<DefaultLayout />} />
          <Route path="/need-fix" element={<DefaultLayout/>} />
          <Route path="/notifications" element={<DefaultLayout/>} />
        </Route>
        <Route path="*" element={<NotFound/>} />
        <Route path="/not-found" element={<NotFound/>} />
      </Routes>
    </Router>
  );
};

export default Routers;
