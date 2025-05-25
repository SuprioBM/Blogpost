import { NavLink } from 'react-router-dom';

const NoUserAbout = () => {
  return (
    <>
    <div className="flex justify-center items-center flex-row-reverse px-7 relative pb-6 pt-2 border-b-1">
      <ul className="flex flex-row gap-4 text-2xl absolute right-5 top-2">
            <li>
              <NavLink to="/signin">Sign In</NavLink>
            </li>
            <li>
              <NavLink to="/signup">Sign Up</NavLink>
            </li>
      </ul>
      <h1 className="text-9xl">BlogSite</h1>
    </div>
    <h1 className='text-4xl pt-20 pb-20 flex justify-center'>Sign in / Sign up to view this page</h1>
    </>
  );
}
export default NoUserAbout