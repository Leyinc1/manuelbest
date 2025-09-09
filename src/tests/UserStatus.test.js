import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import UserStatus from '@/components/UserStatus.vue';
import { createPinia, setActivePinia } from 'pinia';

// Mock the authStore
const mockAuthStore = {
  user: null, // Default state: no user
  login: vi.fn(),
  logout: vi.fn(),
  signup: vi.fn(),
};

// Mock the useAuthStore function
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));

describe('UserStatus.vue', () => {
  beforeEach(() => {
    // Reset Pinia active store and mock state before each test
    setActivePinia(createPinia());
    mockAuthStore.user = null; // Ensure user is null by default for each test
    vi.clearAllMocks(); // Clear any mock calls
  });

  it('renders login/signup buttons when no user is logged in', () => {
    const wrapper = mount(UserStatus);

    expect(wrapper.find('.login-actions').exists()).toBe(true);
    expect(wrapper.find('button').text()).toContain('Iniciar Sesión');
    expect(wrapper.findAll('button').at(1).text()).toContain('Registrarse');
    expect(wrapper.find('.user-info').exists()).toBe(false);
  });

  it('renders user info when a user is logged in', async () => {
    mockAuthStore.user = { email: 'test@example.com' }; // Set user for this test

    const wrapper = mount(UserStatus);

    expect(wrapper.find('.user-info').exists()).toBe(true);
    expect(wrapper.find('span').text()).toContain('Bienvenido, test@example.com');
    expect(wrapper.find('button').text()).toContain('Cerrar Sesión');
    expect(wrapper.find('.login-actions').exists()).toBe(false);
  });

  it('calls authStore.login when "Iniciar Sesión" button is clicked', async () => {
    const wrapper = mount(UserStatus);
    await wrapper.find('button.btn-primary').trigger('click');
    expect(mockAuthStore.login).toHaveBeenCalledTimes(1);
  });

  it('calls authStore.signup when "Registrarse" button is clicked', async () => {
    const wrapper = mount(UserStatus);
    await wrapper.find('button.btn-secondary').trigger('click'); // Corrected selector
    expect(mockAuthStore.signup).toHaveBeenCalledTimes(1);
  });

  it('calls authStore.logout when "Cerrar Sesión" button is clicked', async () => {
    mockAuthStore.user = { email: 'test@example.com' }; // User must be logged in to see logout button
    const wrapper = mount(UserStatus);
    await wrapper.find('button.btn-secondary').trigger('click');
    expect(mockAuthStore.logout).toHaveBeenCalledTimes(1);
  });
});