import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import PropTypes from 'prop-types';

export default function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn fallbackRedirectUrl={window.location.href} forceRedirectUrl={window.location.href} />
      </SignedOut>
    </>
  );
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};
