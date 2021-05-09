import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { User } from '../users/users.model';
import { Role as RoleModel } from '../roles/roles.model';
import { Product } from '../product/product.model';
import { Injectable } from '@nestjs/common';
import { Role } from '../roles/enums/role.enum';

type Subjects =
  | InferSubjects<typeof User | typeof RoleModel | typeof Product>
  | 'all';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: { userId: number; roles: Role[] }) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    if (!user) {
      can(Action.Read, Product);
    } else if (user.roles.includes(Role.ADMIN)) {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      can(Action.Read, 'all');
      can(Action.Create, Product);
      cannot(Action.Read, User);
      can(Action.Update, [Product], { userId: user.userId });
      can(Action.Delete, [Product], { userId: user.userId });
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
