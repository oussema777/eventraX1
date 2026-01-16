import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import UserMessagesCenter from '../components/messaging/UserMessagesCenter';

export default function UserMessagesCenterPage() {
  return (
    <>
      <NavbarLoggedIn />
      <UserMessagesCenter />
    </>
  );
}
