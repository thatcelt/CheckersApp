import { FC, lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ModalProvider } from './context/ModalProvider.tsx';
import { NotificationProvider } from './context/NotifyProvider.tsx';

import AuthorizationProvider from './context/AuthorizationContext.tsx';
import GameProvider from './context/GameContext.tsx'
import PreLoadingPage from './pages/PreLoadingPage.tsx';
import './styles/App.css';

const Profile = lazy(() => import('./pages/ProfilePage.tsx'))
const Games = lazy(() => import("./pages/GamesPage.tsx"))
const Rating = lazy(() => import("./pages/RatingPage.tsx"))
const SelectLevel = lazy(() => import("./pages/LevelSelectingPage.tsx"))
const GameWithBot = lazy(() => import("./pages/GameWithBotPage.tsx"))
const GameWithPlayer = lazy(() => import("./pages/GameOnlinePage.tsx"))
const Settings = lazy(() => import('./pages/SettingsPage.tsx'))
const Friends = lazy(() => import('./pages/FriendsPage.tsx'))
const GameOnOneDevice = lazy(() => import('./pages/GameOnOneDevicePage.tsx'))
const GamesSelecting = lazy(() => import('./pages/GameSelectingPage.tsx'))

const App: FC = () => {
	return (
		<BrowserRouter>
			<ModalProvider>
				<NotificationProvider>
						<AuthorizationProvider>
							<GameProvider>
								<PreLoadingPage>
									<Suspense fallback={<div>Loading...</div>}>
										<Routes>
											<Route path='/' element={<Games/>}/>
											<Route path='/games' element={<Games/>}/>
											<Route path='/select-level' element={<SelectLevel/>}/>
											<Route path='/game-with-bot/:difficulty' element={<GameWithBot/>}/>
											<Route path='/profile' element={<Profile/>}/>
											<Route path='/play' element={<GameWithPlayer/>}/>
											<Route path='/settings' element={<Settings/>}/>
											<Route path='/rating' element={<Rating/>}/>
											<Route path='/friends' element={<Friends/>}/>
											<Route path='/game-on-one-device' element={<GameOnOneDevice/>}/>
											<Route path='/select-game-type' element={<GamesSelecting/>}/>
										</Routes>
									</Suspense>
								</PreLoadingPage>
							</GameProvider>
						</AuthorizationProvider>
				</NotificationProvider>
			</ModalProvider>
		</BrowserRouter>
	)
};

export default App;
