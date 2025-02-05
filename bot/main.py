from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.types.web_app_info import WebAppInfo
from aiogram.filters.command import Command
import asyncio

API_TOKEN = '7654017552:AAEDl7mebBF6ZHdXuZXWD3nDOlY1f9UXdfE'

bot = Bot(token=API_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer("test", 
                         reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="webApp", 
                         web_app=WebAppInfo(url="https://4nl8hqj7-5173.euw.devtunnels.ms/"))]]))

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())