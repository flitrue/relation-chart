import Vue from 'vue'
import Router from 'vue-router'
import Relation from "@/components/Relation/index"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Relation',
      component: Relation
    }
  ]
})
