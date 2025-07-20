import { createRouter, createWebHistory } from 'vue-router'
import OntoFunctionCalculator from '../views/Discrete/OntoFunctionCalculator.vue'
import Placeholder from '../views/LinearAlgebra/Placeholder.vue'
import CombinationPermutationCalculator  from '../views/Discrete/CombinationPermutationCalculator.vue'

const routes = [
  {
    path: '/',
    redirect: '/discrete/onto'
  },
  {
    path: '/discrete/onto',
    name: 'OntoFunction',
    component: OntoFunctionCalculator,
    meta: { category: 'discrete' }
  },
  {
    path: '/linear-algebra/placeholder',
    name: 'LinearPlaceholder',
    component: Placeholder,
    meta: { category: 'linear' }
  },
   {
    path: '/discrete/combinatorics',
    component: CombinationPermutationCalculator
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
