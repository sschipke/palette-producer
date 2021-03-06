import React from 'react';
import { SignupForm, mapStateToProps, mapDispatchToProps } from './SignupForm';
import { setUser } from '../../actions/index'
import { shallow } from 'enzyme';
import { createNewUser, loginUser} from '../../util/apiCalls';

jest.mock('../../util/apiCalls');
const mockSetUser = jest.fn()
const mockLoadProjects = jest.fn()

createNewUser.mockImplementation(() => {
  return Promise.resolve({
    ok: true,
    json: () => jest.fn().mockImplementation(() => {
      return Promise.resolve({
        id: 5,
        name: 'Steve',
        password: '1234'
      })
    })
  })
});

loginUser.mockImplementation(() => Promise.resolve({
  id: 5,
  name: 'Steve',
  password: '1234'
}));

describe('SignupForm', () => {
  let mockUser = {
    id: 5,
    name: 'Steve',
    email: 's@gmail.com',
    password: '1234'
  }
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<SignupForm
    user={null}
    setUser={mockSetUser}
    loadProjects={mockLoadProjects}
    />)

  })
  it('should match the initial snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  });
  describe('handleChange', () => {
    it('should update state if a user types in their username', () => {
      const mockEvent = { target: { id: 'username', value: 'Steve' } };
      expect(wrapper.state('username')).toEqual('');
      wrapper.instance().handleChange(mockEvent);
      expect(wrapper.state('username')).toEqual(mockEvent.target.value)
    })
    it('should update state if a user types in their password', () => {
      const mockEvent = { target: { id: 'password', value: 'password' } };
      wrapper.instance().setState({ username: 'Steve' });
      expect(wrapper.state('username')).toEqual('Steve')

      wrapper.instance().handleChange(mockEvent);
      expect(wrapper.state('password')).toEqual(mockEvent.target.value);
      expect(wrapper.state('username')).toEqual('Steve');
    })
    it('should run handleChange when the inputs detect a change', () => {
      const mockNameEvent = { target: { id: 'username', value: 'Robbie' } };
      const mockPasswordEvent = { target: { id: 'password', value: 'password' } };
      wrapper.instance().handleChange = jest.fn();
      wrapper.instance().forceUpdate();
      wrapper.find('[id="username"]').simulate('change', mockNameEvent);
      wrapper.find('[id="password"]').simulate('change', mockPasswordEvent);
      expect(wrapper.instance().handleChange).toHaveBeenCalledWith(mockNameEvent);
      expect(wrapper.instance().handleChange).toHaveBeenCalledWith(mockPasswordEvent);
    })
  })
  describe('handleSubmit', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallow(<SignupForm 
        user={null}
        setUser={mockSetUser}
        loadProjects={mockLoadProjects}
      />)
    })
    let mockUser = {
      id: 4,
      username: "Susan",
      password: "password"
    }
    it('should prevent the default action when the form is submitted', () => {
      const mockEvent = { preventDefault: jest.fn() };
      wrapper.find('form').simulate('submit', mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })
    it('should call createNewUser, loadProjects, and setUser when called', () => {
      let mockNewUser = {
        username: "Susan",
        password: "password"
      }
      let mockEvent = {preventDefault: jest.fn()}
      createNewUser.mockImplementation(() => {
        return Promise.resolve(mockUser)
      })
      wrapper.instance().setState({ username: 'Susan', password: 'password', confirmPassword: 'password' });
      wrapper.instance().handleSubmit(mockEvent);
      expect(createNewUser).toHaveBeenCalledWith(mockNewUser);
      expect(mockSetUser).toHaveBeenCalled()
      expect(mockLoadProjects).toHaveBeenCalled()

    })
    it('should update with an error if the passwords don\'t match', () => {
      let mockEvent = { preventDefault: jest.fn() }
      createNewUser.mockImplementation(() => {
        return Promise.resolve(mockUser)
      })
      wrapper.instance().setState({ username: 'Susan', password: 'password', confirmPassword: 'wrong' });
      wrapper.instance().handleSubmit(mockEvent);
      expect(wrapper.state('passwordError')).toEqual(true);
      expect(wrapper.state('error')).toEqual('Passwords do not match')
    })
    it('should update its state to be logged in', async () => {
      let mockEvent = {target: 'MEEEEEEE',preventDefault: jest.fn()}
      wrapper.instance().setState({ username: 'Susan', password: 'password', confirmPassword: 'password' });
      expect(wrapper.state('isFormComplete')).toEqual(false);
      await wrapper.instance().handleSubmit(mockEvent)
      await expect(wrapper.state('isFormComplete')).toEqual(true);
    });
    it('should set an error message to state if something goes wrong', async () => {
      let mockEvent = {preventDefault: jest.fn()}
      createNewUser.mockImplementation(() => {
        throw Error('Woops')
      });
      wrapper.instance().forceUpdate()
      await wrapper.instance().handleSubmit(mockEvent);
      expect(wrapper.state('error')).toEqual('Woops')
    })
  })

  describe('alt snapShot', () => {
    it('should match the snapshot if a user is logged in', () => {
      let wrapper = shallow(<SignupForm 
        user={mockUser}
        setUser={mockSetUser}
        loadProjects={mockLoadProjects}
      />);
      wrapper.instance().setState({ isLoggedIn: true });
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('mapStateToProps/mapDispatchToProps', () => {
    it('mapStateToProps gives all the movies in state', () => {
      const mockUser = { username: 'Dave', id: 4 }
      const mockState = {
        user: mockUser
      };
      const expected = {
        user: mockUser
      };
      const mappedProps = mapStateToProps(mockState)
      expect(mappedProps).toEqual(expected)
    });

    it('calls dispatch with setAllPallettes action when it is called', () => {
      const mockUser = { username: 'Dave', id: 4 }
      const mockDispatch = jest.fn();
      const actionToDispatch = setUser('SET_USER', mockUser);
      const mappedProps = mapDispatchToProps(mockDispatch);
      mappedProps.setUser('SET_USER', mockUser);

      expect(mockDispatch).toHaveBeenCalledWith(actionToDispatch);
    });
  })
})

