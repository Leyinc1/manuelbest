import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import UserStatus from '@/components/UserStatus.vue';
import { createPinia, setActivePinia } from 'pinia';

// Mock the authStore
const mockAuthStore = {
  user: null, // Default state: no user
  get isAuthenticated() {
    return !!this.user;
  },
  logout: vi.fn(),
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

  function mountWithStubs() {
    return mount(UserStatus, {
      global: {
        stubs: {
          // Stub RouterLink to avoid needing a real router in unit tests
          RouterLink: {
            template: '<a data-test="router-link"><slot /></a>'
          }
        }
      }
    });
  }

  it('renders a login RouterLink when no user is logged in', () => {
    const wrapper = mountWithStubs();
    expect(wrapper.find('.login-actions').exists()).toBe(true);
    const link = wrapper.find('[data-test="router-link"]');
    expect(link.exists()).toBe(true);
    expect(link.text()).toMatch(/Iniciar Sesión/i);
    expect(wrapper.find('.user-info').exists()).toBe(false);
  });

  it('renders user info when a user is logged in', async () => {
    mockAuthStore.user = { email: 'test@example.com' }; // Set user for this test
    const wrapper = mountWithStubs();
    expect(wrapper.find('.user-info').exists()).toBe(true);
    expect(wrapper.find('span').text()).toContain('Bienvenido, test@example.com');
    expect(wrapper.find('button').text()).toContain('Cerrar Sesión');
    expect(wrapper.find('.login-actions').exists()).toBe(false);
  });

  it('calls authStore.logout when "Cerrar Sesión" button is clicked', async () => {
    mockAuthStore.user = { email: 'test@example.com' }; // User must be logged in to see logout button
    const wrapper = mountWithStubs();
    await wrapper.find('button.btn-secondary').trigger('click');
    expect(mockAuthStore.logout).toHaveBeenCalledTimes(1);
  });
});
