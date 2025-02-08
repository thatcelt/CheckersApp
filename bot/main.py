from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, Message
from aiogram.types.web_app_info import WebAppInfo
from aiogram.filters.command import Command
import asyncio
import aiomysql
import time

API_TOKEN = ''
DB_CONFIG = {
    'host': 'localhost',
    'port': 5000,
    'user': 'root',
    'password': 'root',
    'db': 'happycheckers'
}
APP_URL = ''

bot = Bot(token=API_TOKEN);
dp = Dispatcher();

# как назівается єта песня
# джарвис активировать режим потужності
def extract_referral_parameter(text: str) -> str:
    return text.split()[1] if len(text.split()) > 1 else None;

async def add_user_if_referral(message: Message, referral: str):
    async with aiomysql.connect(**DB_CONFIG) as connection:
        async with connection.cursor() as cursor:
            await cursor.execute('SELECT * FROM user WHERE userId = %s', (message.from_user.id));
            isUserExists = await cursor.fetchone() is not None;

            if not isUserExists:
                await cursor.execute('INSERT INTO user (userId, userTag, username, profilePicture, registrationDate) VALUES (%s, %s, %s, %s, %s)',
                    (message.from_user.id, "", message.from_user.full_name, "", str(time.time() * 1000)));
                await connection.commit();
            
            await cursor.execute('SELECT 1 FROM friendship WHERE (userId = %s AND friendId = %s) OR (userId = %s AND friendId = %s) LIMIT 1', (referral, message.from_user.id, message.from_user.id, referral));
            isFriendshipExists = await cursor.fetchone() is not None;

            if not isFriendshipExists:
                await cursor.execute('INSERT INTO friendship (userId, friendId) VALUES (%s, %s)',
                    (referral, message.from_user.id));
                await connection.commit();

            connection.close();

@dp.message(Command('start'))
async def cmd_start(message: types.Message):
    referral = extract_referral_parameter(message.text);
    if referral and referral != message.from_user.id:
        await add_user_if_referral(message=message, referral=referral);

    await message.answer('test', 
                         reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text='webApp', 
                         web_app=WebAppInfo(url=APP_URL))]]));

async def main():
    await dp.start_polling(bot);

if __name__ == '__main__':
    asyncio.run(main());