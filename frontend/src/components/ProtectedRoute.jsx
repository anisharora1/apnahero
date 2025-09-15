import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import PropTypes from 'prop-types';

export default function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={window.location.href} />
      </SignedOut>
    </>
  );
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};
