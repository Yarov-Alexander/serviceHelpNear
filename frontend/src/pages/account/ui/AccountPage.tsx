import { useState } from "react";
import { MessagesModal, useConversations } from "@/features/account-messages";
import { useAccountOrders } from "@/features/account-orders";
import { ProfileModal } from "@/features/account-profile";
import { CreateOrderModal } from "@/features/create-order-form";
import { AccountOrders } from "@/widgets/account-orders";
import { openModal } from "@/shared/lib/modalStore";
import { FooterAccount } from "@/widgets/footer-account";
import { HeaderAccount } from "@/widgets/header-account";
import { AccountWelcome, welcomePhotoMock } from "@/widgets/account-welcome";
import { useAccountUser } from "../model/useAccountUser";

function getDisplayName(email: string): string {
  const username = (email.split("@")[0] ?? "").replace(/[._-]+/g, " ").trim();
  if (!username) return "Пользователь";
  return username.charAt(0).toLocaleUpperCase("ru-RU") + username.slice(1);
}

export function AccountPage() {
  const { user, loading, logout } = useAccountUser();
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [accountError, setAccountError] = useState("");
  const orders = useAccountOrders(user?.role ?? null, user?.id ? Number(user.id) : null);
  const chats = useConversations(user?.id ? Number(user.id) : null);

  if (loading) {
    return (
      <main className="account">
        <p className="account__note">Загружаем кабинет…</p>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="account">
        <p className="account__note">Войдите, чтобы увидеть кабинет</p>
      </main>
    );
  }

  const name = getDisplayName(user.email);
  const profile = {
    name,
    email: user.email,
    phone: "",
    district: "",
  };
  const unavailableProfileUpdate = async () => {
    throw new Error("Сохранение профиля и смена пароля пока не подключены к серверу.");
  };
  const handleLogout = async () => {
    try {
      await logout();
    } catch (logoutError) {
      setAccountError(
        logoutError instanceof Error ? logoutError.message : "Не удалось завершить сессию.",
      );
    }
  };
  const createRequest = async (input: { task: string; price: number; city: string }) => {
    await orders.create(input);
  };
  const acceptRequest = async (orderId: number) => {
    await orders.accept(orderId);
    chats.refresh();
  };
  const activeRequests = orders.orders.length;

  return (
    <div className="account">
      <HeaderAccount
        user={{ name }}
        unreadMessages={chats.unreadTotal}
        notificationsCount={chats.unreadTotal}
        onNotificationsClick={() => openModal("messages")}
        onLogout={handleLogout}
      />

      <main>
        {accountError && <p className="account__note" role="alert">{accountError}</p>}
        <AccountWelcome
          firstName={name.split(/\s+/)[0] ?? "Пользователь"}
          activeRequests={activeRequests}
          newResponses={0}
          nextHelp={null}
          photoUrl={welcomePhotoMock}
          canCreateRequest={user.role === "customer"}
          onCreateRequest={() => setIsCreateOrderOpen(true)}
        />
        <AccountOrders
          role={user.role}
          orders={orders.orders}
          availableOrders={orders.availableOrders}
          loading={orders.loading}
          error={orders.error}
          availableHasMore={orders.availableHasMore}
          loadingMoreAvailable={orders.loadingMoreAvailable}
          onAccept={acceptRequest}
          onSearchAvailableCity={orders.searchAvailableCity}
          onLoadMoreAvailable={() => void orders.loadMoreAvailable()}
          onCreateRequest={() => setIsCreateOrderOpen(true)}
          onOpenMessages={() => openModal("messages")}
        />
      </main>

      <FooterAccount unreadMessages={chats.unreadTotal} onLogout={handleLogout} />

      <MessagesModal
        conversations={chats.conversations}
        currentUserId={Number(user.id)}
        loading={chats.loading}
        error={chats.error}
        onRefresh={chats.refresh}
      />
      {user.role === "customer" && (
        <CreateOrderModal
          isOpen={isCreateOrderOpen}
          onClose={() => setIsCreateOrderOpen(false)}
          onCreate={createRequest}
        />
      )}
      <ProfileModal
        profile={profile}
        onSave={unavailableProfileUpdate}
        onChangePassword={unavailableProfileUpdate}
      />
    </div>
  );
}
