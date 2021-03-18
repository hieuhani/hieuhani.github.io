import { NavigationBar } from '../organisms/NavigationBar'

export const MainLayout: React.FunctionComponent = ({ children }) => {
  return (
    <>
      <NavigationBar />
      <div className="container">{children}</div>
    </>
  )
}
