import { Inject, Injectable } from '@nestjs/common';
import { Modifier } from 'src/modifier/modifier.entity';

@Injectable()
export class SeedingService {
	constructor(
		@Inject('MODIFIER_REPOSITORY')
		private readonly modifierRepository: typeof Modifier,
	) {}

	async seedModifiers() {
		try {
			await this.modifierRepository.destroy({ where: {} });
			// Create all defaults modifiers
			await this.modifierRepository.create<Modifier>({
				code: 'big_paddle',
				name: 'Bigger Paddle Size',
				desc: 'Increase the size of your paddle and make it easier to hit the ball !',
			});
			await this.modifierRepository.create<Modifier>({
				code: 'small_paddle',
				name: 'Smaller Paddle Size',
				desc: 'Decrease the size of your paddle and make it harder to hit the ball !',
			});
			await this.modifierRepository.create<Modifier>({
				code: 'accelerating_ball',
				name: 'Ball Speed Acceleration',
				desc: 'Increase the speed of the ball each time it hits a paddle !',
			});
			await this.modifierRepository.create<Modifier>({
				code: 'power_up',
				name: 'Power Up',
				desc: 'Add a chance for power up to spawn when the ball hits a paddle !',
			});
			await this.modifierRepository.create<Modifier>({
				code: 'map_1',
				name: 'Custom Map: The Cube',
				desc: 'Replace the default map with a custom one that contains an obstacle at the center: a cube !',
			});
			await this.modifierRepository.create<Modifier>({
				code: 'map_2',
				name: 'Custom Map: The Lines',
				desc: 'Replace the default map with a custom one that contains two horizontals lines and a small hole between them !',
			});
			await this.modifierRepository.create<Modifier>({
				code: 'map_3',
				name: 'Custom Map: The Things',
				desc: 'Replace the default map with ..things !',
			});
		} catch (error) {
			console.error('Error seeding default modifiers:', error);
		}
	}
}
