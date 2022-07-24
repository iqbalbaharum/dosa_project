declare namespace Phaser.GameObjects
{
	interface GameObjectFactory
	{
		playerShip(x: number, y: number, texture: string): IPlayerShip

		projectilePool(config?: Phaser.Types.Physics.Arcade.PhysicsGroupConfig | Phaser.Types.GameObjects.Group.GroupCreateConfig): IProjectilePool
		asteroidPool(config?: Phaser.Types.Physics.Arcade.PhysicsGroupConfig | Phaser.Types.GameObjects.Group.GroupCreateConfig): IAsteroidPool
	}
}