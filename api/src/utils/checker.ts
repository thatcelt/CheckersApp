import * as crypto from 'crypto';

export function verifyTelegramWebAppData(telegramInitData: string): [object | null, string | null] {
	const initData = new URLSearchParams(telegramInitData);

	const hashValue = initData.get('hash');
	if (!hashValue) return [null, 'Hash wasn\'t found'];

	const dataToCheck: string[] = [];
	initData.delete('hash'); 

	const sortedItems = Array.from(initData.entries()).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
	sortedItems.forEach(([key, value]) => dataToCheck.push(`${key}=${value}`));

	const secret = crypto.createHmac('sha256', 'WebAppData')
		.update(process.env.TELEGRAM_BOT_TOKEN as string)
		.digest();

	const computedHash = crypto.createHmac('sha256', secret)
		.update(dataToCheck.join("\n"))
		.digest('hex');

	if (computedHash === hashValue) {
		const user = initData.get('user') ? JSON.parse(decodeURIComponent(initData.get('user') || '')) : null;
		user.id = user.id.toString()
		return [user, null];
	} else {
		return [null, 'Invalid hash'];
	}
}