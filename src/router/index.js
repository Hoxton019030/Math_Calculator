import { createRouter, createWebHistory } from 'vue-router'
import OntoFunctionCalculator from '../views/Discrete/OntoFunctionCalculator.vue'
import Placeholder from '../views/LinearAlgebra/Placeholder.vue'
import CombinationPermutationCalculator  from '../views/Discrete/CombinationPermutationCalculator.vue'
import TreeVisual from '../views/DataStructure/TreeVisual.vue'
import LinearAlgebraCalculator from '../views/LinearAlgebra/LinearAlgebraCalculator.vue'
import GraphVisualizer from '../views/DataStructure/GraphVisualizer.vue'
import EuclideanCalculator from '../views/Discrete/EuclideanCalculator.vue'
import Index from '../views/Index.vue'

const routes = [
    {
    path: '/Math_Calculator',
    component: Index
  },
  {
    path: '/',
    component: Index
  },
    {
    path: '/index',
    component: Index
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
    path: '/discrete/euclidean_gcd',
    component: EuclideanCalculator
  },
   {
    path: '/dataStructure/tree_visual',
    component: TreeVisual
  },
  {
    path: '/dataStructure/graph_visual',
    component: GraphVisualizer
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
