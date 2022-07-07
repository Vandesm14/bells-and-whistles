import { newWorld, newEntity, newComponent } from './ecs.ts';

const world = newWorld();

const entity = newEntity(world, 'box');
newComponent(world, {
  name: 'movenemt',
  entity: entity.id,
  data: { x: 0, y: 0 },
});

console.log(world);
