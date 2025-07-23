import { createRouter, createWebHistory } from 'vue-router'
import OntoFunctionCalculator from '../views/Discrete/OntoFunctionCalculator.vue'
import Placeholder from '../views/LinearAlgebra/Placeholder.vue'
import CombinationPermutationCalculator  from '../views/Discrete/CombinationPermutationCalculator.vue'
import TreeVisual from '../views/DataStructure/TreeVisual.vue'
import LinearAlgebraCalculator from '../views/LinearAlgebra/LinearAlgebraCalculator.vue'

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
    path: '/linear-algebra/LinearAlgebraCalculator',
    name: 'LinearAlgebraCalculator',
    component: LinearAlgebraCalculator,
    meta: { category: 'linear' }
  },
   {
    path: '/discrete/combinatorics',
    component: CombinationPermutationCalculator
  },
   {
    path: '/dataStructure/tree_visual',
    component: TreeVisual
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
