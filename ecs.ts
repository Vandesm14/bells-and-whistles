export const uuid = (): string => crypto.randomUUID().split('-')[0];

export interface Component<T = null> {
  id: string;
  name: string;
  entity: Entity['id'];
  data: T;
  time_created: Date;
  time_modified: Date;
}

export interface Entity {
  id: string;
  name: string;
  time_created: Date;
}

export interface System<T> {
  id: string;
  name: string;
  filter: (component: Component<T>) => boolean;
  fn: (components: Array<Component<T>>) => Component<T>;
}

export interface World {
  components: Map<Component['id'], Component<any>>;
  entities: Map<Entity['id'], Entity>;
  systems: Map<System<any>['id'], System<any>>;
}

export const newWorld = (): World => ({
  components: new Map(),
  entities: new Map(),
  systems: new Map(),
});

export const newEntity = <T>(
  world: World,
  name: Entity['name'],
  components: Array<Component<T>> = []
): Entity => {
  const entity = {
    id: uuid(),
    name,
    time_created: new Date(),
  };
  components.map((component) => world.components.set(component.id, component));
  world.entities.set(entity.id, entity);
  return entity;
};

export const newComponent = <T>(
  world: World,
  partial: Pick<Component<T>, 'name' | 'entity' | 'data'>
): Component<T> => {
  const component = {
    id: uuid(),
    ...partial,
    time_created: new Date(),
    time_modified: new Date(),
  };
  world.components.set(component.id, component);
  return component;
};

export const newSystem = <T>(world: World, partial: Omit<System<T>, 'id'>) => {
  const system = {
    id: uuid(),
    ...partial,
  };
  world.systems.set(system.id, system);
  return system;
};
