import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuards } from './guards'

// 主要页面
import HomeView from '@/views/HomeView.vue'
import ChatHistoryPage from '@/views/Home/ChatHistoryPage.vue'
import CurriculumView from '@/views/CurriculumView.vue'
import TodoView from '@/views/TodoView.vue'
import KnowledgeView from '@/views/KnowledgeView.vue'
import ProfileView from '@/views/ProfileView.vue'

// 认证页面
import LoginPage from '@/views/Auth/LoginPage.vue'
import RegisterPage from '@/views/Auth/RegisterPage.vue'

// 知识库子页面
import OfficialPage from '@/views/Knowledge/OfficialPage.vue'
import CommunityPage from '@/views/Knowledge/CommunityPage.vue'
import MyNotesPage from '@/views/Knowledge/MyNotesPage.vue'
import NoteDetailPage from '@/views/Knowledge/NoteDetailPage.vue'
import NoteEditPage from '@/views/Knowledge/NoteEditPage.vue'

// 个人中心子页面
import ProfileEdit from '@/views/Profile/ProfileEdit.vue'
import PreferenceSettings from '@/views/Profile/PreferenceSettings.vue'
import AboutPage from '@/views/Profile/AboutPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  // 主导航页面
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true, title: '智能助手' }
  },
  {
    path: '/home/history',
    name: 'ChatHistory',
    component: ChatHistoryPage,
    meta: { requiresAuth: true, title: '聊天历史' }
  },
  {
    path: '/curriculum',
    name: 'Curriculum',
    component: CurriculumView,
    meta: { requiresAuth: true, title: '课程表' }
  },
  {
    path: '/todo',
    name: 'Todo',
    component: TodoView,
    meta: { requiresAuth: true, title: '待办事项' }
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: KnowledgeView,
    meta: { requiresAuth: true, title: '知识库' },
    redirect: '/knowledge/my-notes',
    children: [
      {
        path: 'official',
        name: 'OfficialKnowledge',
        component: OfficialPage,
        meta: { title: '官方知识库' }
      },
      {
        path: 'community',
        name: 'CommunityKnowledge',
        component: CommunityPage,
        meta: { title: '社区共建' }
      },
      {
        path: 'my-notes',
        name: 'MyNotes',
        component: MyNotesPage,
        meta: { title: '我的笔记' }
      },
      {
        path: 'note/:id',
        name: 'NoteDetail',
        component: NoteDetailPage,
        meta: { title: '笔记详情' }
      },
      {
        path: 'note/:id/edit',
        name: 'NoteEdit',
        component: NoteEditPage,
        meta: { title: '编辑笔记' }
      }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true, title: '个人中心' }
  },
  // 认证页面
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { title: '注册' }
  },
  // 个人中心子页面
  {
    path: '/profile/edit',
    name: 'ProfileEdit',
    component: ProfileEdit,
    meta: { requiresAuth: true, title: '编辑资料' }
  },
  {
    path: '/profile/preferences',
    name: 'PreferenceSettings',
    component: PreferenceSettings,
    meta: { requiresAuth: true, title: '偏好设置' }
  },
  {
    path: '/profile/about',
    name: 'About',
    component: AboutPage,
    meta: { title: '关于' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 设置路由守卫
setupRouterGuards(router)

export default router
