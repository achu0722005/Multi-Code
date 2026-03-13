import Problem from '../models/Problem.js';

export async function getRandomProblem(req, res) {
  try {
    const count = await Problem.countDocuments();
    if (count === 0) {
      return res.status(404).json({ message: 'No problems seeded yet' });
    }
    const random = Math.floor(Math.random() * count);
    const problem = await Problem.findOne().skip(random);
    return res.json(problem);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch problem' });
  }
}

