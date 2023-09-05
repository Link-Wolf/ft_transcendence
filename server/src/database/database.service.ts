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
			// Create all defaults modifiers
			await this.modifierRepository.create<Modifier>({
				code: 'padddle_size_plus',
				name: 'Bigger Paddle Size',
				desc: 'Increase the size of your paddle and make it easier to hit the ball !',
			});
			await this.modifierRepository.create<Modifier>({
				code: 'ball_speed_acceleration',
				name: 'Ball Speed Acceleration',
				desc: 'Increase the speed of the ball each time it hits a paddle !',
			});
			await this.modifierRepository.create<Modifier>({
				code: 'map_1',
				name: 'Custom Map: The City',
				desc: 'Replace the default map with a custom one with lot of obstacles that represent a city !',
			});
			// await this.modifierRepository.create<Modifier>();
			// await this.modifierRepository.create<Modifier>();

			console.log('Default modifiers seeded successfully');
		} catch (error) {
			console.error('Error seeding default modifiers:', error);
		}
	}
}
