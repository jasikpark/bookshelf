import {formatDate} from '../misc'

test('formatDate formats the date to look nice', () => {
  expect(formatDate(new Date('September 30, 1999'))).toBe('Sep 99')
})
