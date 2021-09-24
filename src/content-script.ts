const badgeURL = chrome.runtime.getURL('images/badge.png');
const usersURL = chrome.runtime.getURL('data/users.txt');

const waitForChat = () =>
  new Promise<void>((resolve) => {
    const observer = new window.MutationObserver(() => {
      if (!document.querySelector('.stream-chat')) return;
      observer.disconnect();
      resolve();
    });

    observer.observe(document.body, {
      childList: true,
    });
  });

const generateBadgeImg = (): HTMLImageElement => {
  const yoinkBadge = document.createElement('img');
  yoinkBadge.src = badgeURL;
  yoinkBadge.style.maxHeight = '18px';

  return yoinkBadge;
};

const listenToChat = (callback: MutationCallback) => {
  const chatElement = document.querySelector('.stream-chat');
  if (!chatElement) return;

  const observer = new window.MutationObserver(callback);

  observer.observe(chatElement, {
    childList: true,
    subtree: true,
  });
};

const isNodeBadgeContainer = (node: Node): node is HTMLSpanElement =>
  (node as HTMLSpanElement).classList?.contains('chat-line__message--badges');

const isNodeMessageContainer = (node: Node): node is HTMLDivElement =>
  (node as HTMLSpanElement).classList?.contains('chat-line__message');

console.log('yoink', 'start');
void (async () => {
  const users = (await (await fetch(usersURL)).text()).split('\n');
  console.log('yoink', 'users', users);

  await waitForChat();
  console.log('yoink', 'chat is here');

  listenToChat((mutations) => {
    console.log(
      'yoink',
      'mutation',
      mutations.map(({addedNodes}) => Array.from(addedNodes)),
    );
    const messageContainers: HTMLDivElement[] = [];
    for (const mutation of mutations) {
      messageContainers.push(
        ...Array.from(mutation.addedNodes).filter(isNodeMessageContainer),
      );
    }

    if (!messageContainers.length) return;

    console.log('yoink', 'messages', messageContainers);

    for (const messageContainer of messageContainers) {
      const nameElement = messageContainer?.querySelector(
        '.chat-author__display-name',
      );

      console.log('yoink', 'nameElement', nameElement);

      let username = (nameElement?.textContent ?? '')
        .trim()
        .toLocaleLowerCase();

      const localizedNameMatch = username.match(/\(([^)]+)\)$/);
      if (localizedNameMatch) {
        username = localizedNameMatch[1];
      }

      console.log('yoink', 'username', username);
      if (!users.includes(username)) continue;

      const badgeContainer =
        messageContainer.querySelector('.chat-line__message--badges') ??
        messageContainer.querySelector('.chat-line__username-container span');
      console.log('yoink', 'badge', badgeContainer);
      if (!badgeContainer) continue;

      badgeContainer.appendChild(generateBadgeImg());
    }
  });
})();
