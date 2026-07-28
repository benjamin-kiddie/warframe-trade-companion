export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startWishlistPoller } = await import("./app/lib/wishlistNotifier");
    startWishlistPoller();
  }
}
